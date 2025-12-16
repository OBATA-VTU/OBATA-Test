import React, { useEffect } from 'react';
import { Smartphone, Zap, Wifi, Tv, CheckCircle, ArrowRight, Star, Users, HelpCircle, ChevronDown, CreditCard, ShieldCheck, PlayCircle, BarChart3, LogIn, Home } from 'lucide-react';
import { Logo } from './Logo';
import { PageView, DashboardTab } from './Layout';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: PageView) => void;
  onDashboardNavigate?: (tab: DashboardTab) => void;
}

const useReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

// Helper Components
const ServiceCard = ({ delay, icon, title, desc }: { delay: string; icon: React.ReactNode; title: string; desc: string }) => (
  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20 reveal" style={{ transitionDelay: `${delay}ms` }}>
    <div className="bg-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-800">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, text, img }: { name: string; role: string; text: string; img: string }) => (
  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors reveal">
    <div className="flex items-center space-x-4 mb-6">
      <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-800" />
      <div>
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </div>
    <div className="mb-4">
      <div className="flex text-amber-500 space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
    </div>
    <p className="text-slate-400 leading-relaxed italic">"{text}"</p>
  </div>
);

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-bold text-lg text-white">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate, onDashboardNavigate }) => {
  useReveal();
  const { currentUser, userProfile } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDashboardClick = () => {
      onGetStarted(); // This now resets to Dashboard Overview via App.tsx
  };

  const handlePricingClick = () => {
      onNavigate('PRICING_PUBLIC');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('LANDING')}>
              <Logo className="h-10 w-10" />
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-400">
                OBATA VTU
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
              <button onClick={() => onNavigate('LANDING')} className="hover:text-blue-400 transition-colors flex items-center"><Home className="w-4 h-4 mr-1"/> Home</button>
              <button onClick={handlePricingClick} className="hover:text-blue-400 transition-colors">Prices</button>
              <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Features</button>
              <button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400 transition-colors">Support</button>
              
              <button 
                onClick={handleDashboardClick}
                className="flex items-center bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full transition-all hover:shadow-lg font-bold border border-emerald-500/50"
              >
                <Zap className="w-4 h-4 mr-2 fill-current" /> {currentUser ? 'Dashboard' : 'Login / Register'}
              </button>
            </div>
             <button 
                onClick={handleDashboardClick}
                className="md:hidden bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold"
              >
                {currentUser ? 'Dashboard' : 'Login'}
              </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-center lg:text-left z-10 reveal">
             
             {currentUser ? (
                 <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-sm font-semibold mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Welcome back, {userProfile?.username || 'User'}!
                 </div>
             ) : (
                 <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-8 animate-fade-in-up">
                    <span className="flex h-2 w-2 relative mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    The #1 VTU Platform in Nigeria
                 </div>
             )}

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              The Smarter Way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-amber-300">
                Pay Bills & Top-up.
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stop overpaying for data. Get instant SME data, airtime, and utility bill payments at the cheapest rates in the market. 
              <span className="block mt-2 text-slate-300 font-semibold">Fast. Secure. Automated.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={handleDashboardClick}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-blue-600/30 flex items-center justify-center"
              >
                {currentUser ? 'Go to Dashboard' : 'Create Free Account'} <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                 onClick={handlePricingClick}
                 className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all border border-slate-700 hover:border-blue-500/50"
              >
                View Price List
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center lg:justify-start space-x-4 text-sm text-slate-500">
               <div className="flex -space-x-2">
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" alt="" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80" alt="" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80" alt="" />
               </div>
               <p>Trusted by <span className="text-white font-bold">5,000+</span> vendors</p>
            </div>
          </div>
          {/* ... (Hero Image remains same) ... */}
           <div className="lg:w-1/2 relative reveal">
             <div className="relative mx-auto w-full max-w-[500px]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-amber-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" 
                  alt="Seamless Mobile Payments" 
                  className="relative rounded-2xl shadow-2xl border border-slate-700 z-10 w-full object-cover h-[550px]"
                />
                
                <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl z-20 flex items-center space-x-3 animate-bounce-slow">
                   <div className="bg-green-500/20 p-2 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-400">Transaction Status</p>
                      <p className="text-sm font-bold text-white">Successful ✅</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ... (Rest of sections remain mostly same) ... */}
    </div>
  );
};