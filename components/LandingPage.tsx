import React, { useState } from 'react';
import { 
  Zap, CheckCircle, ArrowRight, Smartphone, Globe, 
  CreditCard, ChevronDown, Menu, X, ShieldCheck, 
  Wifi, Tv, Phone, SmartphoneIcon, Clock, MousePointer2,
  Users, Award, Shield, Lock, Play, TrendingUp, Heart
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const faqs = [
    { q: "How fast is delivery?", a: "Everything is instant. Our automated systems process and deliver your services in less than 5 seconds after payment is confirmed." },
    { q: "Are your prices truly the best?", a: "Yes. We operate at wholesale volumes, allowing us to offer the most competitive rates for data, airtime, and bill payments in Nigeria." },
    { q: "What if my transaction fails?", a: "Failures are rare, but if they happen, our automated refund protocol returns the money to your wallet instantly." },
    { q: "How do I fund my wallet?", a: "You can fund your wallet instantly using your ATM card or USSD via our secure payment partner, or through direct bank transfer for manual verification." },
    { q: "Can I use Obata VTU for my business?", a: "Absolutely. We have a robust Reseller program that gives you access to even lower rates so you can sell and earn a profit." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white w-full overflow-x-hidden">
      
      {/* Dynamic Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <Logo className="h-10 w-10" />
              <span className="text-xl font-black tracking-tight text-white uppercase italic">
                OBATA <span className="text-blue-500">VTU</span>
              </span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-10 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <button onClick={() => navigate('/')} className="hover:text-blue-500 transition-colors">Home</button>
              <button onClick={() => scrollToSection('services')} className="hover:text-blue-500 transition-colors">Services</button>
              <button onClick={() => scrollToSection('about')} className="hover:text-blue-500 transition-colors">About Us</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-500 transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-blue-500 transition-colors">Help</button>
              
              <button 
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl transition-all font-black shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {currentUser ? 'LAUNCH DASHBOARD' : 'GET STARTED'}
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-slate-400 hover:text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 w-full bg-slate-900 border-b border-slate-800 p-8 space-y-6 shadow-2xl animate-fade-in">
                <button onClick={() => scrollToSection('services')} className="block w-full text-left font-black uppercase text-xs tracking-widest text-slate-400 hover:text-white">Services</button>
                <button onClick={() => scrollToSection('pricing')} className="block w-full text-left font-black uppercase text-xs tracking-widest text-slate-400 hover:text-white">Price List</button>
                <button onClick={() => scrollToSection('faq')} className="block w-full text-left font-black uppercase text-xs tracking-widest text-slate-400 hover:text-white">Support</button>
                <button onClick={() => navigate('/auth')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Join Obata VTU</button>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="text-center lg:text-left space-y-10 animate-fade-in">
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-4 h-4 mr-2" /> 24/7 Automated Delivery System
             </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
              Seamless <br />
              <span className="text-blue-500">Digital </span>
              Connections <br /> Simplified.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium italic">
              Experience the fastest way to buy data, airtime, and settle bills. Join 50,000+ Nigerians trusting Obata VTU for their daily digital needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <button 
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:translate-y-[-2px] shadow-2xl shadow-blue-600/30 flex items-center justify-center active:scale-95"
              >
                Sign Up For Free <ArrowRight className="ml-3 w-5 h-5" />
              </button>
              <button 
                 onClick={() => scrollToSection('pricing')}
                 className="w-full sm:w-auto px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-800 active:scale-95 shadow-xl"
              >
                Price Catalog
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="pt-10 flex flex-wrap justify-center lg:justify-start gap-8 opacity-40 grayscale">
                <div className="flex items-center gap-2"><Smartphone className="w-5 h-5" /><span className="font-black text-[10px] uppercase">MTN</span></div>
                <div className="flex items-center gap-2"><Globe className="w-5 h-5" /><span className="font-black text-[10px] uppercase">AIRTEL</span></div>
                <div className="flex items-center gap-2"><Zap className="w-5 h-5" /><span className="font-black text-[10px] uppercase">GLO</span></div>
                <div className="flex items-center gap-2"><Wifi className="w-5 h-5" /><span className="font-black text-[10px] uppercase">9MOBILE</span></div>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <img 
               src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1200" 
               alt="Digital Connection" 
               className="rounded-[4rem] w-full h-[650px] object-cover shadow-2xl"
             />
             <div className="absolute -top-10 -right-10 bg-white p-6 rounded-[2rem] shadow-2xl z-20 hidden md:block border-4 border-blue-600/10">
                <div className="flex items-center gap-4">
                   <div className="bg-emerald-500/10 p-3 rounded-2xl"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                   <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Instant Transaction</p>
                      <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">Delivery Complete</p>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -left-10 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl z-20 hidden md:block">
                <div className="flex items-center gap-4">
                   <Users className="w-8 h-8 text-blue-500" />
                   <div className="text-left">
                      <p className="text-2xl font-black text-white leading-none tracking-tighter">50K+</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Happy Members</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Hub */}
      <section id="services" className="py-32 px-6 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                  <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 uppercase italic">Our Services</h2>
                  <p className="text-slate-500 text-lg font-bold uppercase tracking-widest italic opacity-60">Professional Digital Solutions At Your Fingertips</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                      { icon: Wifi, title: "Super Data", color: "bg-emerald-600", desc: "Buy the cheapest data bundles for all networks. 1GB, 2GB, up to 100GB instantly." },
                      { icon: SmartphoneIcon, title: "Airtime Top-Up", color: "bg-blue-600", desc: "Top up your phone and get bonuses. Supported on MTN, Airtel, GLO, and 9mobile." },
                      { icon: Tv, title: "TV Subscription", color: "bg-purple-600", desc: "Renew your GOTV, DSTV, and Startimes without stress. Instant activation." },
                      { icon: Zap, title: "Electric Bills", color: "bg-amber-600", desc: "Pay for your electricity tokens and postpaid bills for all major Discos in Nigeria." }
                  ].map((s, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] hover:border-blue-500 transition-all duration-500 group shadow-xl">
                          <div className={`${s.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-2xl shadow-black/50`}>
                             <s.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">{s.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed font-medium">{s.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* About & Trust Section */}
      <section id="about" className="py-40 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5 pointer-events-none">
              <ShieldCheck className="w-[800px] h-[800px] text-blue-500" />
          </div>
          <div className="max-w-7xl mx-auto space-y-48">
              <div className="flex flex-col lg:flex-row items-center gap-24">
                  <div className="lg:w-1/2 order-2 lg:order-1 relative">
                      <img src="https://images.unsplash.com/photo-1556742049-13da736c7459?auto=format&fit=crop&q=80&w=1200" className="rounded-[4rem] shadow-2xl border-8 border-slate-900" alt="Trust" />
                  </div>
                  <div className="lg:w-1/2 space-y-10 order-1 lg:order-2 text-left">
                      <span className="text-blue-500 font-black text-xs uppercase tracking-[0.6em]">Why Choose Obata VTU?</span>
                      <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter">Reliability Is Our Core Language.</h2>
                      <p className="text-xl text-slate-400 leading-relaxed font-medium">
                          We built Obata VTU for speed and trust. In a world where staying connected is vital, we ensure you never experience downtime. 
                      </p>
                      <div className="space-y-6">
                          {[
                            { title: "Military Grade Security", icon: Lock, col: "text-blue-400" },
                            { title: "Instant Auto-Delivery", icon: Zap, col: "text-amber-400" },
                            { title: "24/7 Human Support", icon: Heart, col: "text-rose-400" },
                            { title: "Wallet Integrity Guarantee", icon: ShieldCheck, col: "text-emerald-400" }
                          ].map((item, i) => (
                              <div key={i} className="flex items-center gap-5">
                                  <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${item.col}`}><item.icon className="w-5 h-5" /></div>
                                  <p className="text-slate-200 font-black uppercase text-xs tracking-widest">{item.title}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-24">
                  <div className="lg:w-1/2 space-y-10 text-left">
                      <span className="text-emerald-500 font-black text-xs uppercase tracking-[0.6em]">Earn Profits Daily</span>
                      <h2 className="text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter">Start Your Own VTU Business.</h2>
                      <p className="text-xl text-slate-400 leading-relaxed font-medium">
                          Don't just spend money on data, make money from it. Our Reseller program allows you to buy at massive discounts and sell at your own prices.
                      </p>
                      <div className="grid grid-cols-2 gap-8">
                          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                             <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
                             <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Reseller Discounts</h4>
                             <p className="text-slate-500 text-[10px] font-bold mt-1">Up to 15% off standard rates</p>
                          </div>
                          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                             <Award className="w-8 h-8 text-blue-500 mb-4" />
                             <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Referral Bonus</h4>
                             <p className="text-slate-500 text-[10px] font-bold mt-1">Earn on every friend you invite</p>
                          </div>
                      </div>
                      <button onClick={() => navigate('/auth')} className="inline-flex items-center text-white bg-blue-600 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-95">
                         Become A Partner <ArrowRight className="ml-3 w-4 h-4" />
                      </button>
                  </div>
                  <div className="lg:w-1/2">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" className="rounded-[4rem] shadow-2xl border-8 border-slate-900" alt="Reseller" />
                  </div>
              </div>
          </div>
      </section>

      {/* Real Pricing Feed */}
      <section id="pricing" className="py-40 bg-white text-slate-900 rounded-[5rem] mx-4 md:mx-10 overflow-hidden shadow-inner">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-24">
                  <h2 className="text-6xl lg:text-8xl font-black tracking-tighter mb-4 italic uppercase">Price List</h2>
                  <p className="text-slate-500 text-lg font-bold uppercase tracking-[0.4em] italic opacity-60">The Best Rates Guaranteed In Nigeria</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                      { network: 'MTN', plan: '1.0GB', price: '255', validity: '30 Days', type: 'SME' },
                      { network: 'AIRTEL', plan: '1.0GB', price: '250', validity: '30 Days', type: 'CG' },
                      { network: 'GLO', plan: '1.35GB', price: '450', validity: '30 Days', type: 'Gift' },
                      { network: '9MOBILE', plan: '1.0GB', price: '185', validity: '30 Days', type: 'SME' }
                  ].map((p, i) => (
                      <div key={i} className="bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-12 text-center hover:border-blue-600 transition-all duration-500 group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 bg-blue-600 text-white font-black text-[8px] uppercase tracking-widest rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity">BEST VALUE</div>
                          <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.3em] mb-6">{p.network} {p.type}</p>
                          <h4 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">{p.plan}</h4>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-12">{p.validity}</p>
                          <div className="text-5xl font-black text-slate-900 mb-12 font-mono">₦{p.price}</div>
                          <button onClick={() => navigate('/auth')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">BUY NOW</button>
                      </div>
                  ))}
              </div>
              <div className="mt-24 text-center">
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] italic">...and 500+ more packages available inside your terminal</p>
              </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-40 px-6">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-24">
                  <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 uppercase italic">Questions?</h2>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.6em] italic opacity-60">We Have The Answers You Need</p>
              </div>
              <div className="space-y-6">
                  {faqs.map((f, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden transition-all text-left shadow-xl hover:border-blue-600/30">
                          <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full p-10 flex items-center justify-between group"
                          >
                              <span className="text-xl font-black text-white group-hover:text-blue-500 transition-colors uppercase italic tracking-tight">{f.q}</span>
                              <div className={`p-2.5 rounded-full transition-all ${activeFaq === i ? 'bg-blue-600 rotate-180' : 'bg-slate-800'}`}>
                                 <ChevronDown className={`w-5 h-5 ${activeFaq === i ? 'text-white' : 'text-slate-500'}`} />
                              </div>
                          </button>
                          {activeFaq === i && (
                              <div className="px-10 pb-10 text-slate-400 text-lg font-medium leading-relaxed animate-fade-in border-t border-slate-800 pt-8">
                                  {f.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Pro Footer */}
      <footer className="pt-40 pb-20 px-6 bg-slate-950 border-t border-white/5 text-left">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
              <div className="col-span-1 md:col-span-2 space-y-10">
                  <div className="flex items-center space-x-4">
                      <Logo className="h-14 w-14" />
                      <span className="text-4xl font-black text-white tracking-tighter uppercase italic">OBATA <span className="text-blue-500">VTU</span></span>
                  </div>
                  <p className="text-slate-500 max-w-sm text-xl font-medium leading-relaxed italic opacity-80">Empowering millions with instant digital connections. The standard for reliability in automated telecom services.</p>
                  <div className="flex gap-6 pt-4">
                     <button className="p-4 bg-slate-900 rounded-2xl hover:bg-blue-600 transition-all shadow-xl hover:translate-y-[-4px]"><Phone className="w-5 h-5" /></button>
                     <button className="p-4 bg-slate-900 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl hover:translate-y-[-4px]"><Globe className="w-5 h-5" /></button>
                     <button className="p-4 bg-slate-900 rounded-2xl hover:bg-pink-600 transition-all shadow-xl hover:translate-y-[-4px]"><Heart className="w-5 h-5" /></button>
                  </div>
              </div>
              <div className="space-y-10">
                  <h5 className="text-white font-black text-xs uppercase tracking-[0.4em]">Quick Access</h5>
                  <ul className="space-y-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                      <li><button onClick={() => navigate('/auth')} className="hover:text-blue-500 transition-all">Secure Login</button></li>
                      <li><button onClick={() => navigate('/auth')} className="hover:text-blue-500 transition-all">Create Account</button></li>
                      <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-500 transition-all">Full Price List</button></li>
                      <li><button onClick={() => navigate('/auth')} className="hover:text-blue-500 transition-all">Reseller Portal</button></li>
                  </ul>
              </div>
              <div className="space-y-10">
                  <h5 className="text-white font-black text-xs uppercase tracking-[0.4em]">Operations</h5>
                  <ul className="space-y-6 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                      <li><a href="#" className="hover:text-blue-500 transition-all">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-blue-500 transition-all">Usage Terms</a></li>
                      <li><a href="mailto:support@obatavtu.com" className="hover:text-blue-500 transition-all">Support Mail</a></li>
                      <li><a href="#" className="hover:text-blue-500 transition-all">Contact Us</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[9px] font-black uppercase tracking-[0.5em] gap-8">
              <p>&copy; {new Date().getFullYear()} OBATA AUTOMATION SYSTEMS // REGISTERED PROVIDER</p>
              <div className="flex space-x-12 opacity-50">
                  <span>SECURE SSL ACTIVE</span>
                  <span>POWERED BY INLOMAX</span>
              </div>
          </div>
      </footer>
    </div>
  );
};