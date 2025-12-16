import React from 'react';
import { Shield, Lock, FileText, Mail, Phone, MapPin, CheckCircle, Users, Award } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-full mb-4">
        <Lock className="w-8 h-8 text-blue-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
      <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
    
    <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6 text-slate-300 leading-relaxed">
      <section>
        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
        <p>We collect information that you provide directly to us when you create an account, make a transaction, or contact us for support. This may include your name, email address, phone number, and transaction history.</p>
      </section>
      
      <section>
        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
        <p>We use your information to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and detect and prevent fraud.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect the security of your personal information. Your wallet funding transactions are processed by secure third-party payment processors (e.g., Paystack).</p>
      </section>
    </div>
  </div>
);

export const TermsOfService: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center p-3 bg-amber-600/10 rounded-full mb-4">
        <FileText className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
      <p className="text-slate-400">Please read these terms carefully before using our platform.</p>
    </div>
    
    <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 space-y-6 text-slate-300 leading-relaxed">
      <section>
        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
        <p>By accessing or using OBATA VTU, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
      </section>
      
      <section>
        <h2 className="text-xl font-bold text-white mb-3">2. Service Usage</h2>
        <p>Our platform allows you to purchase airtime, data, and pay bills. You agree to use the service only for lawful purposes and not to engage in any activity that interferes with the proper working of the platform.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-3">3. Refund Policy</h2>
        <p>In the event of a failed transaction where value was not delivered, our system is designed to automatically refund your wallet. If a refund does not occur automatically, please contact support within 24 hours.</p>
      </section>
    </div>
  </div>
);

export const AboutUs: React.FC = () => (
  <div className="max-w-5xl mx-auto animate-fade-in-up">
    <div className="text-center mb-16">
       <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Empowering Connectivity in <span className="text-blue-500">Nigeria</span></h1>
       <p className="text-xl text-slate-400 max-w-2xl mx-auto">OBATA VTU is built on the belief that staying connected shouldn't be expensive or difficult.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
       <div>
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team" className="rounded-2xl shadow-2xl border border-slate-700" />
       </div>
       <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            To provide the most affordable, reliable, and fastest Virtual Top-Up (VTU) services in Nigeria. We bridge the gap between telecom providers and end-users, ensuring you get the best value for every Naira spent.
          </p>
          <div className="space-y-3">
             <div className="flex items-center text-slate-300"><CheckCircle className="w-5 h-5 text-blue-500 mr-3" /> <span>99.9% Server Uptime</span></div>
             <div className="flex items-center text-slate-300"><CheckCircle className="w-5 h-5 text-blue-500 mr-3" /> <span>Instant Delivery</span></div>
             <div className="flex items-center text-slate-300"><CheckCircle className="w-5 h-5 text-blue-500 mr-3" /> <span>Secure Wallet System</span></div>
          </div>
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-6 h-6 text-blue-500" /></div>
          <h3 className="text-white font-bold text-xl mb-2">10k+ Users</h3>
          <p className="text-slate-500">Trusted by thousands of Nigerians daily.</p>
       </div>
       <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
          <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-6 h-6 text-amber-500" /></div>
          <h3 className="text-white font-bold text-xl mb-2">Secure</h3>
          <p className="text-slate-500">Bank-grade encryption for all transactions.</p>
       </div>
       <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Award className="w-6 h-6 text-green-500" /></div>
          <h3 className="text-white font-bold text-xl mb-2">Best Rates</h3>
          <p className="text-slate-500">Wholesale prices for everyone.</p>
       </div>
    </div>
  </div>
);

export const ContactSupport: React.FC = () => (
  <div className="max-w-4xl mx-auto animate-fade-in-up">
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-white mb-4">How can we help?</h1>
      <p className="text-slate-400">Our support team is available 24/7 to assist you.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-start space-x-4">
          <div className="bg-blue-600/20 p-3 rounded-lg"><Mail className="w-6 h-6 text-blue-500" /></div>
          <div>
             <h3 className="text-white font-bold text-lg">Email Support</h3>
             <p className="text-slate-400 text-sm mb-2">For general inquiries and account issues.</p>
             <a href="mailto:support@obatavtu.com" className="text-blue-400 font-medium hover:underline">support@obatavtu.com</a>
          </div>
       </div>
       <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-start space-x-4">
          <div className="bg-green-600/20 p-3 rounded-lg"><Phone className="w-6 h-6 text-green-500" /></div>
          <div>
             <h3 className="text-white font-bold text-lg">Phone Support</h3>
             <p className="text-slate-400 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
             <a href="tel:+2348000000000" className="text-green-400 font-medium hover:underline">+234 800 000 0000</a>
          </div>
       </div>
    </div>

    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
       <h3 className="text-xl font-bold text-white mb-6">Send us a message</h3>
       <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="text" placeholder="Your Name" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
             <input type="email" placeholder="Your Email" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
          </div>
          <input type="text" placeholder="Subject" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full" />
          <textarea rows={5} placeholder="Describe your issue..." className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 w-full"></textarea>
          <button type="button" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors">Send Message</button>
       </form>
    </div>
  </div>
);