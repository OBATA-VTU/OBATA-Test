import React, { useEffect } from 'react';
import { Smartphone, Zap, Wifi, Tv, CheckCircle, ArrowRight, Star, Users, HelpCircle, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { PageView } from './Layout';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (page: PageView) => void;
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
              <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
              <a href="#features" className="hover:text-blue-400 transition-colors">Why Us</a>
              <a href="#testimonials" className="hover:text-blue-400 transition-colors">Reviews</a>
              <button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400 transition-colors">Support</button>
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-full transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] font-bold"
              >
                Login Account
              </button>
            </div>
             <button 
                onClick={onGetStarted}
                className="md:hidden bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold"
              >
                Get Started
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
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                The #1 VTU Platform in Nigeria
             </div>
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
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all hover:-translate-y-1 shadow-xl shadow-blue-600/30 flex items-center justify-center"
              >
                Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                 onClick={onGetStarted}
                 className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all border border-slate-700 hover:border-blue-500/50"
              >
                View Price List
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center lg:justify-start space-x-4 text-sm text-slate-500">
               <div className="flex -space-x-2">
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64" alt="" />
               </div>
               <p>Trusted by <span className="text-white font-bold">5,000+</span> vendors</p>
            </div>
          </div>

          <div className="lg:w-1/2 relative reveal">
             <div className="relative mx-auto w-full max-w-[500px]">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-amber-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1000&q=80" 
                  alt="Happy user paying bills" 
                  className="relative rounded-2xl shadow-2xl border border-slate-700 z-10 w-full object-cover h-[500px]"
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

                <div className="absolute top-10 -right-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl z-20 flex items-center space-x-3 animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
                   <div className="bg-amber-500/20 p-2 rounded-full">
                      <Zap className="w-6 h-6 text-amber-500" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-400">Electricity</p>
                      <p className="text-sm font-bold text-white">Token Generated</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Partners / Logos */}
      <section className="py-10 border-y border-white/5 bg-slate-900/50">
         <div className="max-w-7xl mx-auto px-4 overflow-hidden">
            <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Powered by Industry Leaders</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               <span className="text-xl font-bold text-white flex items-center"><span className="text-yellow-400 text-3xl mr-1">MTN</span></span>
               <span className="text-xl font-bold text-white flex items-center"><span className="text-red-500 text-3xl mr-1">airtel</span></span>
               <span className="text-xl font-bold text-white flex items-center"><span className="text-green-500 text-3xl mr-1">glo</span></span>
               <span className="text-xl font-bold text-white flex items-center"><span className="text-green-800 text-3xl mr-1">9mobile</span></span>
               <span className="text-xl font-bold text-white flex items-center"><span className="text-blue-500 text-3xl mr-1">DSTV</span></span>
            </div>
         </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 reveal">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">One App. <span className="text-blue-500">All Payments.</span></h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">Experience the speed of automated transactions. Whether it's midnight or midday, OBATA VTU delivers instantly.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ServiceCard 
                    delay="0"
                    icon={<Wifi className="w-8 h-8 text-blue-400" />}
                    title="Cheap Data Bundles"
                    desc="Buy SME, Corporate & Gifting data for all networks. Data is valid for 30 days and works on all devices."
                />
                 <ServiceCard 
                    delay="100"
                    icon={<Smartphone className="w-8 h-8 text-amber-400" />}
                    title="Instant Airtime"
                    desc="Never run out of talk time. Top up any network instantly and get up to 3% cash back on every recharge."
                />
                 <ServiceCard 
                    delay="200"
                    icon={<Tv className="w-8 h-8 text-pink-400" />}
                    title="Cable Subscription"
                    desc="Don't miss your favorite shows. Instant activation for DSTV, GOTV, and Startimes with zero service charge."
                />
                 <ServiceCard 
                    delay="300"
                    icon={<Zap className="w-8 h-8 text-yellow-400" />}
                    title="Utility Bills"
                    desc="Pay electricity bills (Prepaid/Postpaid) for IKEDC, AEDC, EKEDC and more. Get your token via SMS instantly."
                />
            </div>
        </div>
      </section>

      {/* Feature Split Section 1 */}
      <section id="features" className="py-24 bg-slate-900/30 overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="lg:w-1/2 reveal">
                  <div className="relative">
                      <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-20"></div>
                      <img 
                          src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=800&q=80" 
                          alt="Secure Analytics" 
                          className="relative rounded-3xl shadow-2xl border border-slate-700 hover:scale-[1.02] transition-transform duration-500"
                      />
                  </div>
               </div>
               <div className="lg:w-1/2 reveal">
                  <h3 className="text-amber-500 font-bold tracking-wider uppercase text-sm mb-4">Security First</h3>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">Bank-Grade Security for your Wallet.</h2>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                     Your funds are safe with us. We use advanced encryption protocols and work with licensed payment processors (Paystack) to ensure every transaction is secure.
                  </p>
                  <ul className="space-y-4">
                     <li className="flex items-center text-slate-300">
                        <div className="bg-blue-500/20 p-1 rounded-full mr-3"><CheckCircle className="w-5 h-5 text-blue-500" /></div>
                        Automated Refund System
                     </li>
                     <li className="flex items-center text-slate-300">
                        <div className="bg-blue-500/20 p-1 rounded-full mr-3"><CheckCircle className="w-5 h-5 text-blue-500" /></div>
                        24/7 Wallet Monitoring
                     </li>
                     <li className="flex items-center text-slate-300">
                        <div className="bg-blue-500/20 p-1 rounded-full mr-3"><CheckCircle className="w-5 h-5 text-blue-500" /></div>
                        Pin & Fingerprint Authentication
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* Feature Split Section 2 */}
      <section className="py-24 bg-slate-950">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
               <div className="lg:w-1/2 reveal">
                  <div className="relative">
                      <div className="absolute inset-0 bg-amber-500 rounded-3xl -rotate-3 opacity-10"></div>
                       <img 
                          src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80" 
                          alt="Fast Transactions" 
                          className="relative rounded-3xl shadow-2xl border border-slate-700 hover:scale-[1.02] transition-transform duration-500"
                      />
                  </div>
               </div>
               <div className="lg:w-1/2 reveal">
                  <h3 className="text-blue-500 font-bold tracking-wider uppercase text-sm mb-4">Speed & Reliability</h3>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">Automated Delivery in <span className="text-amber-500">Seconds.</span></h2>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                     Our system is built on a high-speed dedicated server connection. This means when you click "Buy", you get value instantly. No pending transactions, no stories.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <h4 className="text-3xl font-bold text-white mb-1">0.5s</h4>
                        <p className="text-sm text-slate-500">Average Speed</p>
                     </div>
                     <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <h4 className="text-3xl font-bold text-white mb-1">99.9%</h4>
                        <p className="text-sm text-slate-500">Uptime</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16 reveal">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">What our users say</h2>
                  <div className="flex justify-center items-center space-x-1 text-amber-500">
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                      <Star className="fill-current w-5 h-5" />
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TestimonialCard 
                      name="Emmanuel Adebayo"
                      role="Data Reseller"
                      text="I have tried many platforms, but OBATA VTU is the fastest. Their customer support is also top-notch. Highly recommended!"
                      img="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=100&q=80"
                  />
                  <TestimonialCard 
                      name="Chioma Okeke"
                      role="Student"
                      text="As a student, getting cheap data is a priority. OBATA gives me the best rates for MTN data. I save a lot of money here."
                      img="https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=100&q=80"
                  />
                  <TestimonialCard 
                      name="Musa Ibrahim"
                      role="Business Owner"
                      text="I pay all my shop's electricity bills and cable subscriptions using this app. It has never failed me once. Very reliable."
                      img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  />
              </div>
          </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-950">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
                <FaqItem question="Is the data legitimate?" answer="Yes, all data plans are valid and sourced directly from network providers (MTN, Airtel, etc)." />
                <FaqItem question="How do I fund my wallet?" answer="You can fund your wallet via Bank Transfer to your dedicated account number displayed on your dashboard, or use your ATM card via Paystack." />
                <FaqItem question="What happens if a transaction fails?" answer="If a transaction fails due to network issues, our system automatically reverses your money back to your wallet instantly." />
                <FaqItem question="Can I upgrade to a reseller?" answer="Yes! We have packages for Resellers and API users with even cheaper rates." />
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2.5rem] p-8 md:p-20 text-center border border-blue-500/30 relative overflow-hidden reveal">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                
                <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10 text-white">Join the Smart Side.</h2>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto relative z-10 font-light">
                    Start enjoying the convenience of seamless payments and cheaper rates today. Account opening is free.
                </p>
                <button 
                    onClick={onGetStarted}
                    className="relative z-10 px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-xl transition-transform hover:scale-105 shadow-2xl shadow-blue-900/50"
                >
                    Create Free Account
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center space-x-2 mb-6 cursor-pointer" onClick={() => onNavigate('LANDING')}>
                        <Logo className="h-8 w-8" showRing={false} />
                        <span className="text-xl font-bold text-white">OBATA VTU</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        The reliable VTU platform for all your digital needs. Fast, Secure, and Affordable. We keep you connected to the world.
                    </p>
                    <div className="flex space-x-4">
                        <div onClick={() => onNavigate('SUPPORT')} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Users className="w-5 h-5" /></div>
                        <div onClick={() => onNavigate('SUPPORT')} className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><HelpCircle className="w-5 h-5" /></div>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">Quick Links</h4>
                    <ul className="space-y-4 text-slate-500 text-sm">
                        <li><button onClick={onGetStarted} className="hover:text-blue-400 transition-colors">Buy Data Bundle</button></li>
                        <li><button onClick={onGetStarted} className="hover:text-blue-400 transition-colors">Airtime VTU</button></li>
                        <li><button onClick={onGetStarted} className="hover:text-blue-400 transition-colors">Pay Electric Bills</button></li>
                        <li><button onClick={onGetStarted} className="hover:text-blue-400 transition-colors">Cable TV Sub</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-6">Company</h4>
                    <ul className="space-y-4 text-slate-500 text-sm">
                        <li><button onClick={() => onNavigate('ABOUT')} className="hover:text-blue-400 transition-colors">About Us</button></li>
                        <li><button onClick={() => onNavigate('SUPPORT')} className="hover:text-blue-400 transition-colors">Contact Support</button></li>
                        <li><button onClick={() => onNavigate('TERMS')} className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
                        <li><button onClick={() => onNavigate('PRIVACY')} className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold text-white mb-6">Contact Us</h4>
                    <ul className="space-y-4 text-slate-500 text-sm">
                        <li className="flex items-start">
                           <span className="text-blue-500 mr-2">Email:</span> support@obatavtu.com
                        </li>
                        <li className="flex items-start">
                           <span className="text-blue-500 mr-2">Phone:</span> +234 800 000 0000
                        </li>
                        <li className="flex items-start">
                           <span className="text-blue-500 mr-2">Addr:</span> 123 Lagos Avenue, Ikeja, Lagos State, Nigeria.
                        </li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-white/5 text-center text-slate-600 text-sm flex flex-col md:flex-row justify-between items-center">
                <span>&copy; {new Date().getFullYear()} OBATA VTU Technologies. All rights reserved.</span>
                <span className="mt-2 md:mt-0 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> System Operational</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

const ServiceCard = ({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: string }) => (
    <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all hover:bg-slate-900 group reveal" style={{ transitionDelay: `${delay}ms` }}>
        <div className="mb-6 bg-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform shadow-lg">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
    <div className="relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:-translate-y-2 transition-transform duration-300 reveal">
        <div className="absolute -top-6 left-8 text-6xl font-black text-slate-800 select-none z-0 opacity-50">{number}</div>
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-3 mt-4">{title}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    </div>
);

const TestimonialCard = ({ name, role, text, img }: { name: string, role: string, text: string, img: string }) => (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 reveal">
        <div className="flex items-center space-x-1 text-amber-500 mb-4">
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
        </div>
        <p className="text-slate-300 italic mb-6 leading-relaxed">"{text}"</p>
        <div className="flex items-center space-x-4">
            <img src={img} alt={name} className="w-12 h-12 rounded-full border-2 border-slate-700" />
            <div>
                <h4 className="text-white font-bold text-sm">{name}</h4>
                <p className="text-slate-500 text-xs">{role}</p>
            </div>
        </div>
    </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden reveal">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-semibold hover:bg-slate-800/50 transition-colors"
            >
                {question}
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`px-6 text-slate-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 py-4 border-t border-slate-800' : 'max-h-0'}`}>
                {answer}
            </div>
        </div>
    );
};