import React, { useEffect } from 'react';
import { Zap, CheckCircle, ArrowRight, Star, Users, Shield, Smartphone, Globe, CreditCard, ChevronDown, Menu, X, TrendingUp } from 'lucide-react';
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
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleAuthAction = () => {
      if (currentUser) {
          navigate('/dashboard');
      } else {
          navigate('/auth');
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white w-full overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <Logo className="h-10 w-10" />
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-400">
                OBATA VTU
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
              <button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors flex items-center">Home</button>
              <button onClick={() => { onNavigate('PRICING_PUBLIC'); navigate('/#pricing'); }} className="hover:text-blue-400 transition-colors">Prices</button>
              <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors">Features</button>
              <button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400 transition-colors">Support</button>
              
              <button 
                onClick={handleAuthAction}
                className="flex items-center bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full transition-all hover:shadow-lg font-bold border border-emerald-500/50"
              >
                <Zap className="w-4 h-4 mr-2 fill-current" /> {currentUser ? 'Go to Dashboard' : 'Login / Register'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                 <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                     {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                 </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-fade-in">
                <div className="px-4 pt-2 pb-4 space-y-1">
                    <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Home</button>
                    <button onClick={() => { onNavigate('PRICING_PUBLIC'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Prices</button>
                    <button onClick={() => scrollToSection('features')} className="block w-full text-left px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800">Features</button>
                    <button onClick={handleAuthAction} className="block w-full text-left px-3 py-3 rounded-md text-base font-bold text-emerald-400 hover:bg-slate-800">
                        {currentUser ? 'Dashboard' : 'Login / Register'}
                    </button>
                </div>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden w-full">
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
                    #1 VTU Platform in Nigeria
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
                onClick={handleAuthAction}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-blue-600/30 flex items-center justify-center"
              >
                {currentUser ? 'Go to Dashboard' : 'Create Free Account'} <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                 onClick={() => { onNavigate('PRICING_PUBLIC'); }}
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

      {/* Stats Section */}
      <section className="py-12 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                  <h3 className="text-4xl font-bold text-white mb-2">50k+</h3>
                  <p className="text-slate-400 text-sm">Active Users</p>
              </div>
              <div className="text-center">
                  <h3 className="text-4xl font-bold text-blue-400 mb-2">1M+</h3>
                  <p className="text-slate-400 text-sm">Transactions</p>
              </div>
              <div className="text-center">
                  <h3 className="text-4xl font-bold text-amber-400 mb-2">99.9%</h3>
                  <p className="text-slate-400 text-sm">Uptime</p>
              </div>
              <div className="text-center">
                  <h3 className="text-4xl font-bold text-emerald-400 mb-2">24/7</h3>
                  <p className="text-slate-400 text-sm">Support</p>
              </div>
          </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-2 block">Process</span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">Get started in 3 simple steps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="relative text-center group">
                      <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-600/30 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-500">
                          <Users className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">1. Create Account</h3>
                      <p className="text-slate-400 text-sm">Sign up for free in less than 2 minutes. No paperwork required.</p>
                  </div>
                  <div className="relative text-center group">
                      <div className="w-20 h-20 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-600/30 group-hover:bg-amber-600 group-hover:text-white transition-all text-amber-500">
                          <CreditCard className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">2. Fund Wallet</h3>
                      <p className="text-slate-400 text-sm">Transfer money to your dedicated wallet account instantly.</p>
                  </div>
                  <div className="relative text-center group">
                      <div className="w-20 h-20 bg-emerald-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-600/30 group-hover:bg-emerald-600 group-hover:text-white transition-all text-emerald-500">
                          <Smartphone className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">3. Start Transacting</h3>
                      <p className="text-slate-400 text-sm">Buy airtime, data, and pay bills at the cheapest rates.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <span className="text-emerald-500 font-bold tracking-widest text-xs uppercase mb-2 block">Why Us</span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose OBATA?</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">We've built a platform that puts speed, security, and savings first.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all hover:translate-y-[-5px]">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                          <Zap className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Instant Delivery</h3>
                      <p className="text-slate-400">Our automated system ensures your airtime and data are delivered in seconds.</p>
                  </div>
                   <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-amber-500/50 transition-all hover:translate-y-[-5px]">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6">
                          <Star className="w-6 h-6 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Best Prices</h3>
                      <p className="text-slate-400">Enjoy wholesale rates on all services. Resellers get even bigger discounts.</p>
                  </div>
                   <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all hover:translate-y-[-5px]">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                          <Shield className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Secure Transactions</h3>
                      <p className="text-slate-400">Your funds and data are protected with bank-grade security protocols.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-white mb-4">What our users say</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { name: 'Emmanuel O.', role: 'Data Reseller', text: 'Obata VTU has the best data rates in the market. My business has grown 3x since I switched.' },
                      { name: 'Sarah K.', role: 'Student', text: 'Fast and reliable. I use it for my midnight sub every time. Never failed me once.' },
                      { name: 'David A.', role: 'Entrepreneur', text: 'The API response time is incredible. Integrated it into my app in less than 2 hours.' }
                  ].map((t, i) => (
                      <div key={i} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 relative">
                          <div className="flex text-amber-500 mb-4">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                          </div>
                          <p className="text-slate-300 mb-6 italic">"{t.text}"</p>
                          <div>
                              <p className="text-white font-bold">{t.name}</p>
                              <p className="text-slate-500 text-xs">{t.role}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to save on every top-up?</h2>
              <p className="text-xl text-slate-300 mb-10">Join thousands of satisfied users today and experience the speed.</p>
              <button 
                onClick={handleAuthAction}
                className="bg-white text-blue-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-all shadow-xl hover:scale-105"
              >
                  Create Free Account
              </button>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 w-full">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
                <div className="flex items-center space-x-2 mb-4">
                    <Logo className="h-8 w-8" showRing={false} />
                    <span className="text-xl font-bold text-white">OBATA VTU</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                    The fastest and most reliable VTU platform in Nigeria. Airtime, Data, Cable TV, and Electricity payments made easy.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li><button onClick={() => navigate('/')} className="hover:text-white">Home</button></li>
                    <li><button onClick={() => { onNavigate('PRICING_PUBLIC'); navigate('/#pricing'); }} className="hover:text-white">Pricing</button></li>
                    <li><button onClick={() => handleAuthAction()} className="hover:text-white">Login</button></li>
                    <li><button onClick={() => handleAuthAction()} className="hover:text-white">Register</button></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Services</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li>Buy Data</li>
                    <li>Buy Airtime</li>
                    <li>Cable Subscription</li>
                    <li>Electricity Bills</li>
                    <li>Airtime to Cash</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                    <li>support@obatavtu.com</li>
                    <li>+234 800 000 0000</li>
                    <li>Lagos, Nigeria</li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-600 text-xs">
          <span>&copy; {new Date().getFullYear()} OBATA VTU. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
};