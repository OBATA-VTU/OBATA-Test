import React, { useState } from 'react';
import { 
  Zap, CheckCircle, ArrowRight, Star, Users, Shield, Smartphone, Globe, 
  CreditCard, ChevronDown, Menu, X, ShieldCheck, 
  Wallet, Award, Wifi, Tv, Phone, Heart, SmartphoneIcon, Clock, MousePointer2
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
    { q: "How fast is delivery?", a: "Everything is instant. Once you pay, your data or airtime arrives in seconds." },
    { q: "Are your prices truly cheap?", a: "Yes! We buy in bulk and pass the savings to you. You won't find better rates elsewhere." },
    { q: "What if a transaction fails?", a: "If anything goes wrong, your money is automatically returned to your wallet immediately." },
    { q: "Can I make money here?", a: "Yes. Register as a reseller to buy even cheaper and sell to others at your own price." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white w-full overflow-x-hidden">
      
      {/* Navigation */}
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
              <button onClick={() => scrollToSection('services')} className="hover:text-blue-500 transition-colors">Our Services</button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-500 transition-colors">Price List</button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-blue-500 transition-colors">Help Center</button>
              
              <button 
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl transition-all font-black shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {currentUser ? 'GO TO DASHBOARD' : 'OPEN ACCOUNT'}
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-slate-400">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="text-center lg:text-left space-y-10 animate-fade-in">
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-4 h-4 mr-2" /> FAST, SECURE & ALWAYS ONLINE
             </div>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
              Affordable <br />
              <span className="text-blue-500">Data & Airtime </span>
              For Everyone.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Obata VTU makes it easy for you to buy cheap mobile data, recharge airtime, and pay utility bills in seconds. Join over 10,000 happy customers today.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <button 
                onClick={() => navigate(currentUser ? '/dashboard' : '/auth')}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:translate-y-[-2px] shadow-2xl shadow-blue-600/30 flex items-center justify-center active:scale-95"
              >
                Start Now <ArrowRight className="ml-3 w-5 h-5" />
              </button>
              <button 
                 onClick={() => scrollToSection('pricing')}
                 className="w-full sm:w-auto px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-800 active:scale-95"
              >
                View Prices
              </button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div className="bg-gradient-to-br from-blue-600/20 to-transparent rounded-[3rem] p-4 border border-white/5 shadow-2xl relative z-10">
                <img 
                   src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1200" 
                   alt="Using Phone" 
                   className="rounded-[2.5rem] w-full h-[600px] object-cover"
                />
             </div>
             <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl z-20 hidden md:block">
                <div className="flex items-center gap-4">
                   <div className="bg-emerald-500/10 p-3 rounded-2xl"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
                   <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-black uppercase">Transaction Successful</p>
                      <p className="text-xl font-black text-slate-900">Instant Delivery</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 px-6 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                  <h2 className="text-5xl font-black tracking-tight mb-4 uppercase italic">Our Top Services</h2>
                  <p className="text-slate-400 text-lg">We provide everything you need to stay connected.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                  {[
                      { icon: Wifi, title: "Cheap Data", color: "bg-emerald-600", desc: "Get high-speed data for MTN, Airtel, Glo, and 9mobile at wholesale rates." },
                      { icon: SmartphoneIcon, title: "Airtime Top-up", color: "bg-blue-600", desc: "Instantly recharge your phone and get bonuses on every refill you make." },
                      { icon: Tv, title: "Cable TV", color: "bg-purple-600", desc: "Easily renew your DSTV, GOTV, and Startimes without leaving your home." },
                      { icon: Zap, title: "Electric Bills", color: "bg-amber-600", desc: "Pay for your electricity tokens and postpaid bills in just a few clicks." }
                  ].map((s, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-blue-500 transition-all group">
                          <div className={`${s.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-xl`}>
                             <s.icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4">{s.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Big Feature Section */}
      <section className="py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-40">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                  <div className="lg:w-1/2 order-2 lg:order-1 relative">
                      <img src="https://images.unsplash.com/photo-1556742049-13da736c7459?auto=format&fit=crop&q=80&w=1000" className="rounded-[4rem] shadow-2xl border border-white/5" alt="Business" />
                  </div>
                  <div className="lg:w-1/2 space-y-8 order-1 lg:order-2 text-left">
                      <span className="text-blue-500 font-black text-xs uppercase tracking-[0.4em]">Built for Efficiency</span>
                      <h2 className="text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter">Experience True Reliability.</h2>
                      <p className="text-lg text-slate-400 leading-relaxed font-medium">
                          Our system never sleeps. Whether it's 2 AM or mid-day, our automated servers ensure your bills are paid and your phone is recharged instantly.
                      </p>
                      <div className="space-y-6">
                          {[
                            "Automated delivery system that works 24/7.",
                            "Secure wallet system with advanced PIN protection.",
                            "Instant customer support through our dedicated channels.",
                            "Transparent pricing with no hidden charges."
                          ].map((item, i) => (
                              <div key={i} className="flex items-start space-x-4">
                                  <div className="mt-1 bg-blue-600/20 p-1 rounded-full"><CheckCircle className="w-5 h-5 text-blue-500" /></div>
                                  <p className="text-slate-300 font-bold">{item}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-20">
                  <div className="lg:w-1/2 space-y-8 text-left">
                      <span className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em]">Earn Profits</span>
                      <h2 className="text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter">Become Our Partner.</h2>
                      <p className="text-lg text-slate-400 leading-relaxed font-medium">
                          Join our reseller program and turn your smartphone into a business. Buy at wholesale prices and sell to your customers at your own rates.
                      </p>
                      <button onClick={() => navigate('/auth')} className="inline-flex items-center text-blue-500 font-black uppercase tracking-widest text-sm hover:text-white transition-all group">
                         Start Your Business Today <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </button>
                  </div>
                  <div className="lg:w-1/2">
                      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" className="rounded-[4rem] shadow-2xl border border-white/5" alt="Success" />
                  </div>
              </div>
          </div>
      </section>

      {/* Pricing Table Section */}
      <section id="pricing" className="py-32 bg-white text-slate-900 rounded-[4rem] mx-4 md:mx-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="mb-20">
                  <h2 className="text-6xl font-black tracking-tighter mb-4 italic uppercase">Our Hot Deals</h2>
                  <p className="text-slate-500 text-lg">Check out our current best-selling data bundles.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                      { network: 'MTN', plan: '1.0GB', price: '255', validity: '30 Days', type: 'SME' },
                      { network: 'AIRTEL', plan: '1.0GB', price: '250', validity: '30 Days', type: 'CG' },
                      { network: 'GLO', plan: '1.35GB', price: '450', validity: '30 Days', type: 'Gift' },
                      { network: '9MOBILE', plan: '1.0GB', price: '185', validity: '30 Days', type: 'SME' }
                  ].map((p, i) => (
                      <div key={i} className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-10 text-center hover:border-blue-500 transition-all hover:scale-105 duration-300">
                          <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-4">{p.network} {p.type}</p>
                          <h4 className="text-5xl font-black text-slate-900 mb-2">{p.plan}</h4>
                          <p className="text-slate-400 text-sm mb-10">{p.validity}</p>
                          <div className="text-4xl font-black text-blue-600 mb-10 font-mono">₦{p.price}</div>
                          <button onClick={() => navigate('/auth')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Buy Now</button>
                      </div>
                  ))}
              </div>
              <p className="mt-20 text-slate-400 font-medium italic">And hundreds more plans available inside your dashboard.</p>
          </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-5xl font-black text-center mb-20 tracking-tighter uppercase italic">Common Questions</h2>
              <div className="space-y-6">
                  {faqs.map((f, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden transition-all text-left">
                          <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full p-8 flex items-center justify-between group"
                          >
                              <span className="text-lg font-bold text-white group-hover:text-blue-500 transition-colors">{f.q}</span>
                              <div className={`p-2 rounded-full transition-all ${activeFaq === i ? 'bg-blue-600 rotate-180' : 'bg-slate-800'}`}>
                                 <ChevronDown className={`w-5 h-5 ${activeFaq === i ? 'text-white' : 'text-slate-500'}`} />
                              </div>
                          </button>
                          {activeFaq === i && (
                              <div className="px-8 pb-8 text-slate-400 leading-relaxed font-medium animate-fade-in">
                                  {f.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-20 px-6 bg-slate-950 border-t border-white/5 text-left">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
              <div className="col-span-2 space-y-8">
                  <div className="flex items-center space-x-3">
                      <Logo className="h-12 w-12" />
                      <span className="text-3xl font-black text-white tracking-tighter uppercase italic">OBATA <span className="text-blue-500">VTU</span></span>
                  </div>
                  <p className="text-slate-500 max-w-sm text-lg font-medium leading-relaxed">The trusted platform for all your mobile and utility payments in Nigeria. Fast, cheap, and reliable.</p>
                  <div className="flex gap-4">
                     <button className="p-3 bg-slate-900 rounded-xl hover:bg-blue-600 transition-colors"><Phone className="w-5 h-5" /></button>
                     <button className="p-3 bg-slate-900 rounded-xl hover:bg-blue-600 transition-colors"><Heart className="w-5 h-5" /></button>
                  </div>
              </div>
              <div>
                  <h5 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-10">Quick Links</h5>
                  <ul className="space-y-4 text-slate-500 font-bold text-sm">
                      <li><button onClick={() => navigate('/auth')} className="hover:text-blue-500 transition-colors">Login</button></li>
                      <li><button onClick={() => navigate('/auth')} className="hover:text-blue-500 transition-colors">Register</button></li>
                      <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-500 transition-colors">Pricing</button></li>
                  </ul>
              </div>
              <div>
                  <h5 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-10">Legal</h5>
                  <ul className="space-y-4 text-slate-500 font-bold text-sm">
                      <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
                      <li><a href="mailto:support@obatavtu.com" className="hover:text-blue-500 transition-colors">Contact Support</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-xs font-black uppercase tracking-widest gap-6">
              <p>&copy; {new Date().getFullYear()} OBATA AUTOMATION SYSTEMS</p>
              <div className="flex space-x-10">
                  <span>SSL ENCRYPTED</span>
                  <span>POWERED BY INLOMAX</span>
              </div>
          </div>
      </footer>
    </div>
  );
};