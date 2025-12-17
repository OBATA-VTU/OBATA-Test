import React, { useEffect, useState } from 'react';
import { 
  Zap, CheckCircle, ArrowRight, Star, Users, Shield, Smartphone, Globe, 
  CreditCard, ChevronDown, Menu, X, TrendingUp, Info, ShieldCheck, 
  Wallet, Headphones, BarChart, SmartphoneIcon, Wifi, Tv, HelpCircle, 
  Plus, Minus, Globe2, Sparkles, Server, ArrowUpRight, Award, Lock, Play
} from 'lucide-react';
import { Logo } from './Logo';
import { PageView, DashboardTab } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate }) => {
  useReveal();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const faqs = [
    { q: "How fast is delivery?", a: "Delivery is 100% automated and instant. Transactions are typically completed in under 10 seconds." },
    { q: "What networks do you support?", a: "We support MTN, AIRTEL, GLO, and 9MOBILE for data, airtime, and gifting services." },
    { q: "Is my wallet safe?", a: "Yes. Your funds are secured with bank-grade encryption and 4-digit transaction PINs for every purchase." },
    { q: "How do I fund my wallet?", a: "You can fund using your debit card (Paystack), automated bank transfer (Monnify), or manual deposit." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white w-full overflow-x-hidden">
      
      {/* Dynamic Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <Logo className="h-10 w-10" />
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-300 tracking-tighter">
                OBATA VTU
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors">Home</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-400 transition-colors">Prices</button>
              <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Ecosystem</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-blue-400 transition-colors">Support</button>
              
              <button 
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-full transition-all hover:shadow-2xl shadow-blue-600/20 font-black border border-blue-500/50 active:scale-95"
              >
                {currentUser ? 'DASHBOARD' : 'GET STARTED'}
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-400 hover:text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </nav>

      {/* Hero: Higher Impact */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] -z-10 animate-pulse-glow"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 text-center lg:text-left reveal">
             <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-900/20 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                <Sparkles className="w-4 h-4 mr-3" />
                Voted #1 Automated Gateway 2024
             </div>

            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Buy Data <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-amber-300">
                Faster.
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Obata VTU offers the cheapest data bundles and instant airtime top-up. Experience a seamless gateway to all network providers.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <button 
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-1 shadow-2xl shadow-blue-600/30 flex items-center justify-center active:scale-95"
              >
                Launch App Now <ArrowRight className="ml-3 w-5 h-5" />
              </button>
              <button 
                 onClick={() => scrollToSection('pricing')}
                 className="w-full sm:w-auto px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all border border-slate-800 active:scale-95"
              >
                View Price List
              </button>
            </div>
          </div>
          
           <div className="lg:w-1/2 relative reveal delay-200">
             <div className="relative mx-auto w-full max-w-[550px]">
                <div className="absolute -inset-10 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-[100px] opacity-40"></div>
                <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-3 rounded-[3rem] shadow-2xl relative z-10">
                   <img 
                      src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop" 
                      alt="Interface" 
                      className="rounded-[2.5rem] w-full object-cover h-[600px] grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                   />
                </div>
                
                {/* Floating Micro-UI */}
                <div className="absolute top-10 -right-12 bg-white p-6 rounded-[2rem] shadow-2xl z-20 animate-float">
                   <div className="flex items-center space-x-4">
                      <div className="bg-emerald-500/10 p-3 rounded-2xl"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                      <div>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Delivered</p>
                         <p className="text-xl font-black text-slate-900 tracking-tighter">₦2,500.00</p>
                      </div>
                   </div>
                </div>
                <div className="absolute -bottom-10 -left-12 bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl z-20 animate-bounce-slow">
                   <div className="flex items-center space-x-4">
                      <div className="bg-blue-500/10 p-3 rounded-2xl"><Zap className="w-8 h-8 text-blue-500 fill-current" /></div>
                      <div>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Processing Speed</p>
                         <p className="text-xl font-black text-white tracking-tighter">0.4 SECONDS</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-900/30 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
              <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mb-12">Core Infrastructure Partners</p>
              <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale transition-all duration-700 hover:grayscale-0 hover:opacity-100">
                  <div className="text-3xl font-black italic">MTN</div>
                  <div className="text-3xl font-black italic">Airtel</div>
                  <div className="text-3xl font-black italic">GLO</div>
                  <div className="text-3xl font-black italic">Paystack</div>
                  <div className="text-3xl font-black italic">Monnify</div>
                  <div className="text-3xl font-black italic">9Mobile</div>
              </div>
          </div>
      </section>

      {/* Services Detail: Ecosystem */}
      <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="reveal">
                  <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6 block">Platform Ecosystem</span>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-[0.9] tracking-tighter">The Complete Digital <br /> Utilities Hub.</h2>
                  
                  <div className="grid gap-10">
                      {[
                        { icon: Wifi, title: "Cheapest Data", desc: "SME, CG & Corporate gifting data at wholesale rates for all major networks." },
                        { icon: SmartphoneIcon, title: "Airtime Top-up", desc: "Instantly recharge your phone or send credits to loved ones with cash-back." },
                        { icon: Tv, title: "Cable Subscriptions", desc: "Zero-delay activation for DSTV, GOTV & Startimes packages." },
                        { icon: Award, title: "Reward Tiers", desc: "Earn commissions as a Reseller and get bonuses for every referral." }
                      ].map((s, idx) => (
                         <div key={idx} className="flex items-start space-x-6 group">
                            <div className="bg-slate-900 border border-slate-800 p-5 rounded-[1.5rem] group-hover:bg-blue-600 transition-all duration-500 shadow-xl group-hover:shadow-blue-600/20">
                               <s.icon className="w-6 h-6 text-blue-400 group-hover:text-white" />
                            </div>
                            <div>
                               <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
                               <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{s.desc}</p>
                            </div>
                         </div>
                      ))}
                  </div>
              </div>
              <div className="relative reveal delay-300">
                  <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-white/5 rounded-[4rem] p-10">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" className="rounded-[3rem] shadow-2xl" alt="Analytics" />
                  </div>
                  <div className="absolute top-1/2 -right-16 -translate-y-1/2 hidden xl:block">
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-3xl w-72 animate-float">
                         <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] text-slate-500 font-black uppercase">Growth Meter</span>
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                         </div>
                         <div className="space-y-4">
                            <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden"><div className="h-full bg-blue-500 w-[80%]"></div></div>
                            <div className="h-2 bg-slate-800 rounded-full w-3/4 overflow-hidden"><div className="h-full bg-blue-500 w-[60%]"></div></div>
                            <div className="h-2 bg-slate-800 rounded-full w-1/2 overflow-hidden"><div className="h-full bg-blue-500 w-[90%]"></div></div>
                         </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Pricing Grid */}
      <section id="pricing" className="py-32 bg-slate-900/20 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <h2 className="text-5xl md:text-7xl font-black mb-6