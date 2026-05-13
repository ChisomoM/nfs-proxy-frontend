import React from 'react';
import { LoginForm } from '@/components/auth/loginForm';
import { LayoutDashboard, Wallet, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthFeatureItem } from '@/components/shared/AuthFeatureItem';

export const MerchantLoginPage: React.FC = () => {
  return (
    <main className="h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Right side - Brand showcase (Now on left for visual variety compared to admin) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 sidebar-ambient" />
        
        {/* Subtle motion patterns */}
        <div className="absolute inset-0 opacity-20">
          <motion.div 
            animate={{ 
              backgroundPosition: ["100% 100%", "0% 0%"],
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white w-full h-full">
          <div className="max-w-xl space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-2">
                <span className="h-2 w-2 rounded-full bg-gp-sky animate-pulse" />
                <span className="font-sans text-[10px] font-bold tracking-widest uppercase text-white/80">Merchant Portal</span>
              </div>
              <h2 className="font-display text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white">
                Empowering your <span className="text-gp-sky">business growth</span> across Zambia.
              </h2>
              <p className="font-sans text-lg xl:text-xl text-white/70 leading-relaxed max-w-lg">
                Access the GeePay Merchant Portal to monitor real-time transactions, manage payment projects, and reconcile settlements with ease.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="grid gap-4 mt-8"
            >
              <AuthFeatureItem
                icon={<LayoutDashboard className="w-5 h-5 text-gp-sky" />}
                title="Consolidated Dashboard"
                description="View all your payment channels in one unified interface."
              />
              <AuthFeatureItem
                icon={<Wallet className="w-5 h-5 text-gp-sky" />}
                title="Instant Settlement Tracking"
                description="Keep track of every Kwacha settled to your bank account."
              />
              <AuthFeatureItem
                icon={<ShieldCheck className="w-5 h-5 text-gp-sky" />}
                title="PCI-DSS Level 1 Security"
                description="Your customer data and transaction history are fortified."
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-12 left-12 flex items-center gap-2 text-white/40">
          <Zap className="h-4 w-4 fill-current" />
          <span className="font-mono text-xs tracking-widest">POWERED BY GEEPAY NFS PROXY</span>
        </div>
      </div>

      {/* Left side - Form content */}
      <div className="w-full lg:w-[45%] xl:w-[40%] px-6 py-12 md:px-12 lg:px-16 flex flex-col justify-center h-full relative z-10 bg-white">
        <div className="absolute top-12 right-12 lg:right-16 hidden lg:block">
           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="font-display font-medium text-sm text-gray-400">GeePay for Merchants</span>
          </motion.div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <LoginForm accountType="merchant" />
          
          <div className="mt-8 text-center">
            <p className="font-sans text-sm text-gray-400">
              New to GeePay? <button className="text-gp-cobalt font-semibold hover:underline">Apply for a Merchant Account</button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};


