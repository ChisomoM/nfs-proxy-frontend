import { Lightbulb, Key, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export const QuickstartGuide = () => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gp-cobalt-100/50 to-gp-sky-100/50 border border-gp-cobalt/10 rounded-[2.5rem] p-10 mb-16 relative overflow-hidden shadow-sm"
    >
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gp-sky/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gp-cobalt/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-display-sm font-display font-bold mb-6 flex items-center gap-4 text-gp-cobalt">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Lightbulb className="h-7 w-7 text-gp-sky" />
          </div>
          Get Started with GeePay NFS API
        </h2>

        <div className="mb-12 p-8 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white shadow-sm">
          <h3 className="text-text-xl font-display font-semibold text-gray-900 mb-4">The Unified API for Zambian Payments</h3>
          <p className="text-gray-600 leading-relaxed font-sans">
            The GeePay NFS Proxy API provides a single, high-reliability interface for interacting with the National Financial Switch. 
            Automate your payment dispatches, query transaction statuses, and manage your float across various registries through a simple RESTful interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1: Get API Key */}
          <div className="group bg-white/40 p-6 rounded-[1.5rem] border border-white/60 hover:bg-white/60 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gp-cobalt text-white text-sm font-bold shadow-sm">1</span>
              <h4 className="font-display font-semibold text-text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-gp-cobalt" />
                Auth Credentials
              </h4>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-sans">
              Find your API Project Keys in the management dashboard under your specific environment settings.
            </p>
            <Button variant="brand" className="w-full py-6 rounded-xl shadow-lg border-0 group-hover:scale-[1.02] transition-transform" asChild>
              <a href="/merchant/projects">
                Configure Projects <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

          {/* Step 2: Queue Verification */}
          <div className="group bg-white/40 p-6 rounded-[1.5rem] border border-white/60 hover:bg-white/60 transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gp-cobalt text-white text-sm font-bold shadow-sm">2</span>
              <h4 className="font-display font-semibold text-text-lg flex items-center gap-2">
                <Send className="h-5 w-5 text-gp-cobalt" />
                Post Request
              </h4>
            </div>
            <p className="text-sm text-gray-500 mb-4 font-sans leading-snug">
              Every request requires a Bearer token in the header. Use our Sandbox keys to test without moving real funds.
            </p>
            <div className="bg-slate-900 p-4 rounded-xl shadow-inner border border-slate-800">
                <code className="block text-[11px] font-mono text-white whitespace-pre-wrap">
                  POST /api/v1/transactions
                </code>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 font-mono">Header: Authorization: Bearer {`{sk_sandbox_...}`}</p>
          </div>

          {/* Step 3: Check Status */}
           <div className="group bg-white/40 p-6 rounded-[1.5rem] border border-white/60 hover:bg-white/60 transition-colors col-span-1 md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gp-cobalt text-white text-sm font-bold shadow-sm">3</span>
                        <h4 className="font-display font-semibold text-text-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-gp-cobalt" />
                            Handle Results
                        </h4>
                    </div>
                    <p className="text-sm text-gray-500 font-sans leading-relaxed">
                        Poll the transaction endpoint or configure a <strong className="text-gp-cobalt">webhook</strong> in your project settings 
                        to receive real-time push notifications when a payment settles or fails.
                    </p>
                </div>
                <div className="flex-shrink-0 bg-success/10 border border-success/20 p-5 rounded-2xl flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-success uppercase tracking-wider">Status: Settled</p>
                        <p className="text-[10px] text-gray-500 font-sans">Payment finalized on NFS</p>
                     </div>
                </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
